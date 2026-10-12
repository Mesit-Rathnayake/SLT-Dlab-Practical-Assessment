package auth

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"medwizard-backend/internal/models"
)

var (
	ErrInvalidToken = errors.New("invalid or expired token")
	jwtSecret       = []byte("medwizard-secret-jwt-signing-key-2026")
)

func init() {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		jwtSecret = []byte(s)
	}
}

// Claims represents JWT payload
type Claims struct {
	UserID             int64  `json:"user_id"`
	Email              string `json:"email"`
	Role               string `json:"role"`
	DoctorID           *int64 `json:"doctor_id,omitempty"`
	MustChangePassword bool   `json:"must_change_password"`
	jwt.RegisteredClaims
}

// HashPassword hashes a plaintext password with bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// CheckPasswordHash compares plaintext password against stored hash
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken creates a signed JWT valid for 24 hours
func GenerateToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:             user.ID,
		Email:              user.Email,
		Role:               user.Role,
		DoctorID:           user.DoctorID,
		MustChangePassword: user.MustChangePassword,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "medwizard-api",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

// ParseToken parses and validates a token string
func ParseToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

// AuthMiddleware validates Authorization Bearer token header
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization format must be Bearer <token>"})
			return
		}

		claims, err := ParseToken(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		c.Set("claims", claims)
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)
		c.Set("doctorID", claims.DoctorID)
		c.Next()
	}
}

// RequireRole checks if the authenticated user has one of the allowed roles
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: Role not determined"})
			return
		}

		userRole, ok := roleVal.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied: Invalid role type"})
			return
		}

		hasRole := false
		for _, r := range allowedRoles {
			if strings.EqualFold(r, userRole) {
				hasRole = true
				break
			}
		}

		if !hasRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Forbidden: You do not have permission to access this resource",
			})
			return
		}

		c.Next()
	}
}
