package com.library.auth.infrastructure.security;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.enums.UserStatus;
import com.library.auth.domain.service.AccountValidationService;
import com.library.auth.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final AccountValidationService accountValidationService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        Map<String, Object> attrs = oAuth2User.getAttributes();
        String email = (String) attrs.get("email");
        String googleId = (String) attrs.get("sub");
        String name = (String) attrs.get("name");
        String picture = (String) attrs.get("picture");
        Boolean emailVerified = (Boolean) attrs.get("email_verified");

        if (Boolean.FALSE.equals(emailVerified)) {
            throw new OAuth2AuthenticationException("Google email not verified");
        }

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setGoogleId(googleId);
                    newUser.setAvatarUrl(picture);
                    newUser.setRole(UserRole.READER);
                    newUser.setStatus(UserStatus.ACTIVE);
                    return userRepository.save(newUser);
                });

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            if (user.getStatus() == UserStatus.PENDING) {
                user.setStatus(UserStatus.ACTIVE);
            }
        }

        user.setAvatarUrl(picture);
        userRepository.save(user);

        try {
            accountValidationService.validateLoginable(user);
        } catch (Exception e) {
            throw new OAuth2AuthenticationException(e.getMessage());
        }

        log.info("OAuth2 login success: email={}, googleId={}", email, googleId);

        return new DefaultOAuth2User(oAuth2User.getAuthorities(), attrs, "email");
    }
}
