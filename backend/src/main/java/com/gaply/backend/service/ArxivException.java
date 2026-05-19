package com.gaply.backend.service;

import org.springframework.http.HttpStatus;

public class ArxivException extends RuntimeException {

    private final HttpStatus status;

    public ArxivException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
