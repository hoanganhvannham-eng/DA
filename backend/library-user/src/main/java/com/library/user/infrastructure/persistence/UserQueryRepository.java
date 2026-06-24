package com.library.user.infrastructure.persistence;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.enums.UserStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserQueryRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u ORDER BY u.joinedDate DESC")
    Page<User> findAllByOrderByJoinedDateDesc(Pageable pageable);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY u.joinedDate DESC")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role ORDER BY u.joinedDate DESC")
    Page<User> findByRole(@Param("role") UserRole role, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ADMIN' AND u.status = :status AND u.id <> :userId")
    long countOtherActiveAdmins(@Param("userId") UUID userId, @Param("status") UserStatus status);

    @Modifying
    @Query("UPDATE User u SET u.status = :newStatus, u.updatedBy = :adminId, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId AND u.status = :expectedCurrent")
    int deactivateUser(@Param("userId") UUID userId, @Param("adminId") UUID adminId, @Param("newStatus") UserStatus newStatus, @Param("expectedCurrent") UserStatus expectedCurrent);

    @Modifying
    @Query("UPDATE User u SET u.status = :newStatus, u.updatedBy = :adminId, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId AND u.status = :expectedCurrent")
    int activateUser(@Param("userId") UUID userId, @Param("adminId") UUID adminId, @Param("newStatus") UserStatus newStatus, @Param("expectedCurrent") UserStatus expectedCurrent);

    @Modifying
    @Query("UPDATE User u SET u.role = :newRole, u.updatedBy = :adminId, u.updatedAt = CURRENT_TIMESTAMP WHERE u.id = :userId")
    int updateRole(@Param("userId") UUID userId, @Param("adminId") UUID adminId, @Param("newRole") UserRole newRole);
}
