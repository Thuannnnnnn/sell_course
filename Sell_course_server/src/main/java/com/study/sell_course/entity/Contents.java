package com.study.sell_course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name ="contents")
public class Contents {
    @Id
    @Column(name = "content_id", nullable = false)
    private String contentId;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @OneToMany(mappedBy = "contents", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Video> video;

    @OneToMany(mappedBy = "contents", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Docs> docs;

}
