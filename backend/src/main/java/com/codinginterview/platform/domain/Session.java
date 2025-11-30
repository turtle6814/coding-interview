package com.codinginterview.platform.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Session {
    @Id
    private String id;

    private String language;

    @Lob
    private String code;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> users = new ArrayList<>();

    public Session(String id, String language, String code) {
        this.id = id;
        this.language = language;
        this.code = code;
    }
}
