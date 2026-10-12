package service

import (
	"testing"
	"time"
)

func TestParseDateTime(t *testing.T) {
	testCases := []struct {
		name      string
		input     string
		expectErr bool
	}{
		{
			name:      "RFC3339 format",
			input:     "2026-10-15T14:30:00Z",
			expectErr: false,
		},
		{
			name:      "HTML5 datetime-local without seconds",
			input:     "2026-10-15T14:30",
			expectErr: false,
		},
		{
			name:      "HTML5 datetime-local with seconds",
			input:     "2026-10-15T14:30:00",
			expectErr: false,
		},
		{
			name:      "Standard SQL datetime",
			input:     "2026-10-15 14:30:00",
			expectErr: false,
		},
		{
			name:      "Invalid format",
			input:     "invalid-date-string",
			expectErr: true,
		},
		{
			name:      "Gibberish numbers",
			input:     "9999-99-99 99:99",
			expectErr: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			parsed, err := parseDateTime(tc.input)
			if tc.expectErr && err == nil {
				t.Fatalf("expected error for input %q, but got nil", tc.input)
			}
			if !tc.expectErr && err != nil {
				t.Fatalf("unexpected error for input %q: %v", tc.input, err)
			}
			if !tc.expectErr && parsed.IsZero() {
				t.Fatalf("parsed time is zero value for valid input %q", tc.input)
			}
		})
	}
}

func TestStatusValidation(t *testing.T) {
	valid := []string{"Scheduled", "In-Progress", "Completed", "Cancelled"}
	for _, s := range valid {
		if !validStatuses[s] {
			t.Errorf("status %s should be valid", s)
		}
	}

	invalid := []string{"Pending", "Unknown", "Foo", "scheduled", ""}
	for _, s := range invalid {
		if validStatuses[s] {
			t.Errorf("status %s should NOT be recognized as valid", s)
		}
	}
}

func TestConflictIntervalLogic(t *testing.T) {
	// Verify interval arithmetic logic for conflict checking
	start := time.Date(2026, 10, 15, 10, 0, 0, 0, time.UTC)
	duration := 30 // minutes
	end := start.Add(time.Duration(duration) * time.Minute)

	expectedEnd := time.Date(2026, 10, 15, 10, 30, 0, 0, time.UTC)
	if !end.Equal(expectedEnd) {
		t.Errorf("expected end time %v, got %v", expectedEnd, end)
	}
}
