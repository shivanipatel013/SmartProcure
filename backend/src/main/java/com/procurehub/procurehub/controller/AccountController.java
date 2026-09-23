package com.procurehub.procurehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.procurehub.procurehub.entity.Account;
import com.procurehub.procurehub.repository.AccountRepository;

@RestController
@RequestMapping("/account")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    // Create Account
    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountRepository.save(account);
    }

    // Get All Accounts
    @GetMapping
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    // Get Account By ID
    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable Long id) {
        return accountRepository.findById(id).orElse(null);
    }

    // Update Account
    @PutMapping("/{id}")
    public Account updateAccount(
            @PathVariable Long id,
            @RequestBody Account account) {

        Account existing = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        existing.setAccountHolderName(account.getAccountHolderName());
        existing.setAccountNumber(account.getAccountNumber());
        existing.setBankName(account.getBankName());
        existing.setIfscCode(account.getIfscCode());
        existing.setBranchName(account.getBranchName());
        existing.setAccountType(account.getAccountType());

        return accountRepository.save(existing);
    }

    // Delete Account
    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable Long id) {

        if (!accountRepository.existsById(id)) {
            return "Account not found";
        }

        accountRepository.deleteById(id);

        return "Account deleted successfully";
    }
}