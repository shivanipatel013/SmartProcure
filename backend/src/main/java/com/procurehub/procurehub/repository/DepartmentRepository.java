package com.procurehub.procurehub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.procurehub.procurehub.entity.Department;

@Repository
public interface DepartmentRepository 
extends JpaRepository<Department, Long> {

}