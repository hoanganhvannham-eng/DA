package com.library.bookreturn.presentation.controller;

import com.library.bookreturn.application.service.ReturnService;
import com.library.bookreturn.presentation.dto.request.BulkConfirmReturnRequest;
import com.library.bookreturn.presentation.dto.request.ConfirmReturnRequest;
import com.library.bookreturn.presentation.dto.request.CreateReturnRequest;
import com.library.bookreturn.presentation.dto.response.BulkConfirmReturnResponse;
import com.library.bookreturn.presentation.dto.response.ConfirmReturnResponse;
import com.library.bookreturn.presentation.dto.response.CreateReturnResponse;
import com.library.bookreturn.presentation.dto.response.PendingReturnDTO;
import com.library.common.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
@Validated
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<CreateReturnResponse> createReturnRequest(
            @Valid @RequestBody CreateReturnRequest request,
            CurrentUser currentUser) {

        CreateReturnResponse response = returnService.createReturnRequest(currentUser.id(), request);
        URI location = URI.create("/api/v1/returns/" + response.getBorrowRecord().getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<PendingReturnDTO>> getPendingReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(name = "returnMethod", required = false) String returnMethod) {
        Page<PendingReturnDTO> returns = returnService.getPendingReturns(page, size, search, status, returnMethod);
        return ResponseEntity.ok(returns);
    }

    @PostMapping("/{borrowId}/confirm")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ConfirmReturnResponse> confirmReturn(
            @PathVariable UUID borrowId,
            @Valid @RequestBody ConfirmReturnRequest request,
            CurrentUser currentUser) {

        ConfirmReturnResponse response = returnService.confirmReturn(borrowId, request, currentUser.id());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk-confirm")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BulkConfirmReturnResponse> bulkConfirmReturn(
            @Valid @RequestBody BulkConfirmReturnRequest request,
            CurrentUser currentUser) {

        BulkConfirmReturnResponse response = returnService.bulkConfirmReturn(request, currentUser.id());
        return ResponseEntity.ok(response);
    }
}
