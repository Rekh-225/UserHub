using System.ComponentModel.DataAnnotations;

namespace UserManagement.Models
{
    /// <summary>
    /// Represents a user entity in the system.
    /// </summary>
    public class User
    {
        /// <summary>Primary key – auto-incremented by the database.</summary>
        public int Id { get; set; }

        /// <summary>Full name of the user (required, max 100 characters).</summary>
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters.")]
        public string FullName { get; set; } = string.Empty;

        /// <summary>Email address of the user (required, must be a valid email).</summary>
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "A valid email address is required.")]
        [StringLength(150, ErrorMessage = "Email must not exceed 150 characters.")]
        public string Email { get; set; } = string.Empty;

        /// <summary>Date of birth of the user (required).</summary>
        [Required(ErrorMessage = "Birth date is required.")]
        [DataType(DataType.Date)]
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// Date and time when the user was registered.
        /// Automatically set on creation; not editable by the client.
        /// </summary>
        [DataType(DataType.DateTime)]
        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
    }
}
