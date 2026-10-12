package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"medwizard-backend/internal/auth"
	"medwizard-backend/internal/models"
	"medwizard-backend/internal/repository"
	"medwizard-backend/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
	userRepo    *repository.UserRepository
}

func NewAuthHandler(authService *service.AuthService, userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
		return
	}

	resp, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// ChangePassword handles POST /api/v1/auth/change-password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	claimsVal, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	claims := claimsVal.(*auth.Claims)

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current and new password are required"})
		return
	}

	if err := h.authService.ChangePassword(claims.UserID, req.CurrentPassword, req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch updated user to generate fresh token with must_change_password=false
	user, _ := h.userRepo.GetByID(claims.UserID)
	var newToken string
	if user != nil {
		newToken, _ = auth.GenerateToken(user)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully",
		"token":   newToken,
		"user":    user,
	})
}

// GetMe handles GET /api/v1/auth/me
func (h *AuthHandler) GetMe(c *gin.Context) {
	claimsVal, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	claims := claimsVal.(*auth.Claims)

	user, err := h.userRepo.GetByID(claims.UserID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
