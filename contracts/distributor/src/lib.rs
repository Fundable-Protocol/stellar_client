#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec};

#[contract]
pub struct DistributorContract;

#[contractimpl]
impl DistributorContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage()
            .instance()
            .set(&Symbol::new(&env, "admin"), &admin);
    }

    /// Distribute equal amounts to multiple recipients
    /// Total amount is divided equally among all recipients
    pub fn distribute_equal(
        _env: Env,
        sender: Address,
        _token: Address,
        total_amount: i128,
        recipients: Vec<Address>,
    ) {
        sender.require_auth();

        let recipient_count = recipients.len() as i128;
        assert!(recipient_count > 0, "No recipients provided");
        assert!(total_amount > 0, "Amount must be positive");

        let amount_per_recipient = total_amount / recipient_count;
        assert!(amount_per_recipient > 0, "Amount too small to distribute");

        // TODO: Transfer tokens from sender to each recipient
        // This would use the token contract's transfer function
        for _recipient in recipients.iter() {
            // token.transfer(sender, recipient, amount_per_recipient)
        }
    }

    /// Distribute weighted amounts to multiple recipients
    /// Each recipient receives their specified amount
    pub fn distribute_weighted(
        _env: Env,
        sender: Address,
        _token: Address,
        recipients: Vec<Address>,
        amounts: Vec<i128>,
    ) {
        sender.require_auth();

        assert!(
            recipients.len() == amounts.len(),
            "Recipients and amounts must match"
        );
        assert!(!recipients.is_empty(), "No recipients provided");

        // TODO: Transfer tokens from sender to each recipient with their specified amount
        for i in 0..recipients.len() {
            let _recipient = recipients.get(i).unwrap();
            let _amount = amounts.get(i).unwrap();
            // token.transfer(sender, recipient, amount)
        }
    }

    /// Get the admin address
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&Symbol::new(&env, "admin"))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(DistributorContract, ());
        let client = DistributorContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin);

        let stored_admin = client.get_admin();
        assert_eq!(stored_admin, Some(admin));
    }
}
