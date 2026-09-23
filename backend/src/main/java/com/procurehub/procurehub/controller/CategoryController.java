package com.procurehub.procurehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.procurehub.procurehub.entity.Category;
import com.procurehub.procurehub.repository.CategoryRepository;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping("/getCategoryByDepartmentId/{departmentId}")
    public List<Category> getCategoryByDepartmentId(@PathVariable Long departmentId) {
        return categoryRepository.findByDepartmentDepartmentId(departmentId);
    }

    @PostMapping("/addCategory")
    public Category addCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    @GetMapping("/getAllCategories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}



