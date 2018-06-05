using System;
using System.Text;
using System.Web;

namespace EveryAngle.Shared.Helpers
{
    public static class Base64Helper
    {
        public static string Decode(string encoded)
        {
            return Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
        }

        public static string Encode(string decoded)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(decoded));
        }
    }
}
