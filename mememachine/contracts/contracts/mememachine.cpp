//contractName:mememachine
#include <mememachine/mememachine.hpp>

namespace eosio {

void mememachine::create( const name&   creator,
                    const asset&  maximum_supply,
                    const asset& tokens_per_mint,
                    const std::string& metadata
){
    require_auth(creator);

    auto sym = maximum_supply.symbol;
    check( maximum_supply.is_valid(), "invalid supply");
    check( maximum_supply.amount > 0, "max-supply must be positive");
    check( tokens_per_mint.is_valid(), "invalid tokens_per_mint");
    check( tokens_per_mint.amount > 0, "tokens_per_mint must be positive");
    check( sym == tokens_per_mint.symbol, "token and max symbol mismatch" );
    check( metadata.size() <= 256, "metadata has more than 256 bytes" );

    tokens tokenstable( get_self(), get_self().value );
    auto index = tokenstable.get_index<"byticker"_n>();
    auto existing = index.find(get_ticker_name(sym));
    check( existing == index.end(), "token with symbol already exists" );

    stats statstable( get_self(), sym.code().raw() );
    statstable.emplace( creator, [&]( auto& s ) {
       s.supply.symbol = maximum_supply.symbol;
       s.max_supply    = maximum_supply;
       s.issuer        = creator;
       s.tokens_per_mint = tokens_per_mint;
    });

    tokenstable.emplace( creator, [&]( auto& t ) {
       t.ticker = maximum_supply.symbol;
       t.metadata = metadata;
    });
}


void mememachine::mint( const name& minter, const symbol& sym, const std::string memo) {
    require_auth( minter );

    check( sym.is_valid(), "invalid symbol name" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist, create token before minting" );
    auto quantity = existing->tokens_per_mint;

    // if over, only mint the remaining
    if (existing->supply + quantity > existing->max_supply) {
        quantity = existing->max_supply - existing->supply;
    }

    check( quantity.amount > 0, "nothing left to mint" );

    statstable.modify( existing, same_payer, [&]( auto& s ) {
       s.supply += quantity;
    });

    add_balance( minter, quantity, minter );
}

void mememachine::burn( const name& account, const asset& quantity ) {
    require_auth( account );

    auto sym = quantity.symbol;
    check( sym.is_valid(), "invalid symbol name" );

    stats statstable( get_self(), sym.code().raw() );
    auto existing = statstable.find( sym.code().raw() );
    check( existing != statstable.end(), "token with symbol does not exist" );
    const auto& st = *existing;

    accounts from_acnts( get_self(), account.value );
    const auto& from = from_acnts.get( sym.code().raw(), "no balance object found" );
    check( from.balance.amount >= quantity.amount, "overdrawn balance" );

    statstable.modify( st, same_payer, [&]( auto& s ) {
       s.supply -= quantity;
       s.max_supply -= quantity;
    });

    sub_balance( account, quantity );
}

void mememachine::transfer( const name&    from,
                      const name&    to,
                      const asset&   quantity,
                      const string&  memo ) {
    check( from != to, "cannot transfer to self" );
    require_auth( from );
    check( is_account( to ), "to account does not exist");

    auto sym = quantity.symbol.code();
    stats statstable( get_self(), sym.raw() );
    const auto& st = statstable.get( sym.raw() );

    check( quantity.is_valid(), "invalid quantity" );
    check( quantity.amount > 0, "must transfer positive quantity" );
    check( quantity.symbol == st.supply.symbol, "symbol precision mismatch" );
    check( memo.size() <= 256, "memo has more than 256 bytes" );

    auto payer = has_auth( to ) ? to : from;

    sub_balance( from, quantity );
    add_balance( to, quantity, payer );

    require_recipient( from );
    require_recipient( to );
}

void mememachine::sub_balance( const name& owner, const asset& value ) {
   accounts from_acnts( get_self(), owner.value );

   const auto& from = from_acnts.get( value.symbol.code().raw(), "no balance object found" );
   check( from.balance.amount >= value.amount, "overdrawn balance" );

   from_acnts.modify( from, owner, [&]( auto& a ) {
         a.balance -= value;
      });
}

void mememachine::add_balance( const name& owner, const asset& value, const name& ram_payer ) {
   accounts to_acnts( get_self(), owner.value );
   auto to = to_acnts.find( value.symbol.code().raw() );
   if( to == to_acnts.end() ) {
      to_acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = value;
      });
   } else {
      to_acnts.modify( to, same_payer, [&]( auto& a ) {
        a.balance += value;
      });
   }
}

void mememachine::open( const name& owner, const symbol& symbol, const name& ram_payer ) {
   require_auth( ram_payer );

   check( is_account( owner ), "owner account does not exist" );

   auto sym_code_raw = symbol.code().raw();
   stats statstable( get_self(), sym_code_raw );
   const auto& st = statstable.get( sym_code_raw, "symbol does not exist" );
   check( st.supply.symbol == symbol, "symbol precision mismatch" );

   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( sym_code_raw );
   if( it == acnts.end() ) {
      acnts.emplace( ram_payer, [&]( auto& a ){
        a.balance = asset{0, symbol};
      });
   }
}

void mememachine::close( const name& owner, const symbol& symbol ) {
   require_auth( owner );
   accounts acnts( get_self(), owner.value );
   auto it = acnts.find( symbol.code().raw() );
   check( it != acnts.end(), "Balance row already deleted or never existed. Action won't have any effect." );
   check( it->balance.amount == 0, "Cannot close because the balance is not zero." );
   acnts.erase( it );
}

} /// namespace eosio
