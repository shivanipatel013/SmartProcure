package com.procurehub.procurehub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.procurehub.procurehub.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByDepartmentDepartmentId(Long departmentId);

}