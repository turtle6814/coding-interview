package com.codinginterview.platform.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sessions")
public class Session {
    
    @Id
    private String id;
    
    @Column(nullable = false)
    private String language;
    
    @Column(columnDefinition = "TEXT")
    private String code;
    
    @ElementCollection
    private List<String> users = new ArrayList<>();
    
    // Constructors
    public Session() {
    }
    
    public Session(String id, String language, String code) {
        this.id = id;
        this.language = language;
        this.code = code;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public List<String> getUsers() {
        return users;
    }
    
    public void setUsers(List<String> users) {
        this.users = users;
    }
}