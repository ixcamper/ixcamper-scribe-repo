package com.ixcamper.scribe.repository;

import com.ixcamper.scribe.model.Note; // Ensure this import is here

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
	// Spring Data JPA magic: This generates the SQL automatically
    List<Note> findAllByOrderByIdDesc();

	List<Note> findAllByOrderByCreatedAtDesc();

	@Query("SELECT n FROM Note n WHERE LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))")
	List<Note> searchNotes(@Param("query") String query);

	List<Note> findByCategory(String category);

	
}