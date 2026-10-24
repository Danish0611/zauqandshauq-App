package com.zauqandshauq.dto;

import java.util.List;

public record CsvUploadResponse(
    boolean success,
    String message,
    int totalRows,
    int insertedCount,
    int updatedCount,
    List<String> errors
) {
}

