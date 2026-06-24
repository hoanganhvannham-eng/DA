package com.library.bookreturn.presentation.controller;

import com.library.bookreturn.application.service.ReturnService;
import com.library.bookreturn.presentation.dto.request.ResolveReturnLostRequest;
import com.library.bookreturn.presentation.dto.response.CreateReturnShipmentResponse;
import com.library.bookreturn.presentation.dto.response.ResolveReturnLostResponse;
import com.library.bookreturn.presentation.dto.response.ReturnShippingIssueDTO;
import com.library.bookreturn.presentation.dto.response.ReturnShippingRequestedDTO;
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
@RequestMapping("/api/v1/borrows")
@RequiredArgsConstructor
@Validated
public class ReturnShippingController {

    private final ReturnService returnService;

    @GetMapping("/return-requested")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<ReturnShippingRequestedDTO>> getReturnRequestedBorrows(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Page<ReturnShippingRequestedDTO> result = returnService.getReturnRequestedBorrows(page, size, search);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/return-issues")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<ReturnShippingIssueDTO>> getReturnShippingIssues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String statusFilter) {
        Page<ReturnShippingIssueDTO> result = returnService.getReturnShippingIssues(page, size, search, statusFilter);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{borrowId}/return-shipment")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<CreateReturnShipmentResponse> createReturnShipment(
            @PathVariable UUID borrowId,
            CurrentUser currentUser) {
        CreateReturnShipmentResponse response = returnService.createReturnShipment(borrowId, currentUser.id());
        URI location = URI.create("/api/v1/borrows/" + borrowId + "/return-shipment");
        return ResponseEntity.created(location).body(response);
    }

    @PostMapping("/{borrowId}/retry-return-shipping")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Void> retryReturnShipping(
            @PathVariable UUID borrowId) {
        returnService.retryReturnShipping(borrowId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{borrowId}/resolve-return-lost")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ResolveReturnLostResponse> resolveReturnLost(
            @PathVariable UUID borrowId,
            @Valid @RequestBody ResolveReturnLostRequest request,
            CurrentUser currentUser) {
        ResolveReturnLostResponse response = returnService.resolveReturnLost(borrowId, request, currentUser.id());
        return ResponseEntity.ok(response);
    }
}
