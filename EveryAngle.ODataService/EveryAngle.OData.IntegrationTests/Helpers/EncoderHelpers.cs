using System;
using System.Text;

namespace EveryAngle.OData.IntegrationTests.Helpers
{
    public static class EncoderHelpers
    {
        public static string Base64Encode(string plaintext)
        {
            var plainTextBytes = Encoding.UTF8.GetBytes(plaintext);
            return Convert.ToBase64String(plainTextBytes);
        }
    }
}