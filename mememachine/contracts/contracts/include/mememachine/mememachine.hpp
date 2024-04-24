#pragma once

#include <eosio/asset.hpp>
#include <eosio/eosio.hpp>

#include <string>

namespace eosiosystem {
   class system_contract;
}

namespace eosio {

   using std::string;

   class [[eosio::contract("mememachine")]] mememachine : public contract {
      public:
         using contract::contract;

         [[eosio::action]]
         void create( const name&   creator,
                      const asset&  maximum_supply,
                      const asset& tokens_per_mint,
                      const std::string& metadata);

         [[eosio::action]]
         void mint( const name& minter, const symbol& sym, const std::string memo );

         [[eosio::action]]
         void burn( const name& account, const asset& quantity );

         [[eosio::action]]
         void transfer( const name&    from,
                        const name&    to,
                        const asset&   quantity,
                        const string&  memo );

         [[eosio::action]]
         void open( const name& owner, const symbol& symbol, const name& ram_payer );

         [[eosio::action]]
         void close( const name& owner, const symbol& symbol );

         static uint64_t get_ticker_name(const symbol& sym) {
            std::string ticker = sym.code().to_string();
            std::transform(ticker.begin(), ticker.end(), ticker.begin(), ::tolower);
            name tickername(ticker);
            return tickername.value;
         }

         static asset get_supply( const name& token_contract_account, const symbol_code& sym_code )
         {
            stats statstable( token_contract_account, sym_code.raw() );
            const auto& st = statstable.get( sym_code.raw(), "invalid supply symbol code" );
            return st.supply;
         }

         static asset get_balance( const name& token_contract_account, const name& owner, const symbol_code& sym_code )
         {
            accounts accountstable( token_contract_account, owner.value );
            const auto& ac = accountstable.get( sym_code.raw(), "no balance with specified symbol" );
            return ac.balance;
         }

         using create_action = eosio::action_wrapper<"create"_n, &mememachine::create>;
         using issue_action = eosio::action_wrapper<"mint"_n, &mememachine::mint>;
         using retire_action = eosio::action_wrapper<"burn"_n, &mememachine::burn>;
         using transfer_action = eosio::action_wrapper<"transfer"_n, &mememachine::transfer>;
         using open_action = eosio::action_wrapper<"open"_n, &mememachine::open>;
         using close_action = eosio::action_wrapper<"close"_n, &mememachine::close>;
      private:
         struct [[eosio::table]] account {
            asset    balance;

            uint64_t primary_key()const { return balance.symbol.code().raw(); }
         };

         struct [[eosio::table]] currency_stats {
            asset           supply;
            asset           max_supply;
            name            issuer;
            asset           tokens_per_mint;

            uint64_t primary_key()const { return supply.symbol.code().raw(); }
         };

         struct [[eosio::table]] tokens_model {
            symbol           ticker;
            std::string      metadata;

            uint64_t primary_key()const { return ticker.code().raw(); }
            uint64_t by_ticker_name() const {
                return get_ticker_name(ticker);
            }
         };

         typedef eosio::multi_index< "accounts"_n, account > accounts;
         typedef eosio::multi_index< "stat"_n, currency_stats > stats;
         typedef eosio::multi_index< "tokens"_n, tokens_model,
            indexed_by<"byticker"_n, const_mem_fun<tokens_model, uint64_t, &tokens_model::by_ticker_name>>
         > tokens;

         void sub_balance( const name& owner, const asset& value );
         void add_balance( const name& owner, const asset& value, const name& ram_payer );
   };

}
