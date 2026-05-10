package com.ixcamper.scribe.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        return new ResponseEntity<>(
            Map.of("error", "Internal Server Error", "message", ex.getMessage()), 
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}