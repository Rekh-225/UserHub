using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagement.Data;
using UserManagement.Models;

namespace UserManagement.Controllers
{
    /// <summary>
    /// RESTful API controller for user CRUD operations.
    /// Base route: /api/users
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // ──────────────────────────────────────────────
        // GET /api/users — List all users
        // ──────────────────────────────────────────────
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.RegistrationDate)
                .ToListAsync();

            return Ok(users);
        }

        // ──────────────────────────────────────────────
        // GET /api/users/{id} — Get a specific user
        // ──────────────────────────────────────────────
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            return Ok(user);
        }

        // ──────────────────────────────────────────────
        // POST /api/users — Create a new user
        // ──────────────────────────────────────────────
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check for duplicate email
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == user.Email.ToLower()))
                return Conflict(new { message = "A user with this email already exists." });

            // Set registration date to now
            user.RegistrationDate = DateTime.UtcNow;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // ──────────────────────────────────────────────
        // PUT /api/users/{id} — Update an existing user
        // ──────────────────────────────────────────────
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            // Check for duplicate email (excluding current user)
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == updatedUser.Email.ToLower() && u.Id != id))
                return Conflict(new { message = "A user with this email already exists." });

            // Update fields (preserve original RegistrationDate)
            user.FullName = updatedUser.FullName;
            user.Email = updatedUser.Email;
            user.BirthDate = updatedUser.BirthDate;

            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // ──────────────────────────────────────────────
        // DELETE /api/users/{id} — Delete a user
        // ──────────────────────────────────────────────
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
