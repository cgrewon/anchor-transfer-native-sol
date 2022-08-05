use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

declare_id!("5jomVtGNTKPuMLvv8erAXHBVjJsTwuv5kF6dT83ECyN9");

#[program]
pub mod sol_transfer {
    use super::*;
    
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn lamp_transfer(ctx: Context<SolTransfer>, amount: u64) -> Result<()> {

         if  amount <= 0 {
            msg!(format!("Insufficient amount to transfer. {} Lamports  ", amount).as_str());
            return Err(ErrorCode::InsufficientFunds.into());
         }

        

        let ix_transfer = transfer(
            &ctx.accounts.user.key(), // From account
            &ctx.accounts.receiver.key(),     // To account
            amount,
        );

        // Need to call the system program
        // to transfer funds from accounts not owned by the program
        invoke(
            &ix_transfer,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.receiver.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!(format!("{} Lamport transferred ", amount).as_str());

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}


#[derive(Accounts)]
pub struct SolTransfer<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    
    pub system_program: Program <'info, System>,
}


#[error_code]
pub enum ErrorCode {
 
    #[msg("insufficient funds for transaction")]
    InsufficientFunds,
}