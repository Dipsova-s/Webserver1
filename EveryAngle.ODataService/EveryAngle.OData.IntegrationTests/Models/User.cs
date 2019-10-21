namespace EveryAngle.OData.IntegrationTests.Models
{
    public class User
    {
        public string UserName { get; set; }

        public string Password { get; set; }

        public User(string username, string pass)
        {
            UserName = username;
            Password = pass;
        }
    }
}