using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Web;

namespace EveryAngle.Shared.EmbeddedViews
{
    public static class Util
    {
        public static void SaveStreamToFile(string fileFullPath, Stream stream)
        {
            if (stream.Length == 0) 
                return;

            // Create a FileStream object to write a stream to a file
            using (FileStream fileStream = System.IO.File.Create(fileFullPath, (int)stream.Length))
            {
                // Fill the bytes[] array with the stream data
                
                byte[] bytesInStream = new byte[stream.Length];

                while ((stream.Read(bytesInStream, 0, bytesInStream.Length)) > 0)
                {
                    // Use FileStream object to write to the specified file
                    fileStream.Write(bytesInStream, 0, bytesInStream.Length);
                }                
            }
        }

        private static bool IsPrivateIpAddress(string ipAddress)
        {
            // http://en.wikipedia.org/wiki/Private_network
            // Private IP Addresses are: 
            //  24-bit block: 10.0.0.0 through 10.255.255.255
            //  20-bit block: 172.16.0.0 through 172.31.255.255
            //  16-bit block: 192.168.0.0 through 192.168.255.255
            //  Link-local addresses: 169.254.0.0 through 169.254.255.255 (http://en.wikipedia.org/wiki/Link-local_address)

            var ip = IPAddress.Parse(ipAddress);
            var octets = ip.GetAddressBytes();

            var is24BitBlock = octets[0] == 10;
            if (is24BitBlock) 
                return true; 

            var is20BitBlock = octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31;
            if (is20BitBlock) 
                return true; 

            var is16BitBlock = octets[0] == 192 && octets[1] == 168;
            if (is16BitBlock) 
                return true; 

            var isLinkLocalAddress = octets[0] == 169 && octets[1] == 254;
            return isLinkLocalAddress;
        }

        /// <summary>
        /// Get current user ip address.
        /// </summary>
        /// <returns>The IP Address</returns>
        public static string GetIPAddress()
        {
            var context = System.Web.HttpContext.Current;
            string ipAddress = String.Empty;

            if (context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null)
                ipAddress = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
            else if (!String.IsNullOrWhiteSpace(context.Request.UserHostAddress))
                ipAddress = context.Request.UserHostAddress;

            if (ipAddress == "::1")
                ipAddress = "127.0.0.1";

            return ipAddress;
        }

    }
}
