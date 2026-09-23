package com.procurehub.procurehub.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.procurehub.procurehub.entity.Department;
import com.procurehub.procurehub.repository.DepartmentRepository;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping("/getAllDepartments")
    public List<Department> getAllDepartment() {
        return departmentRepository.findAll();
    }

    @GetMapping("/getDepartmentByDepartmentId/{departmentId}")
    public Department getDepartmentByDepartmentId(@PathVariable Long departmentId) {
        return departmentRepository.findById(departmentId).orElse(null);
    }

    @PostMapping("/addDepartment")
    public Department addDepartment(@RequestBody Department department) {
    return departmentRepository.save(department);
    }

}