using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Web;

namespace EveryAngle.Shared.EmbeddedViews
{
    public static class Util
    {
        const string LocalhostIP4 = "127.0.0.1";
        const string LocalhostIP6 = "::1";

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

        /// <summary>
        /// Get current user ip address.
        /// </summary>
        /// <returns>The IP Address</returns>
        public static string GetIPAddress()
        {
            var context = HttpContext.Current;
            string ipAddress = string.Empty;

            if (context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null)
                ipAddress = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
            else if (!string.IsNullOrWhiteSpace(context.Request.UserHostAddress))
                ipAddress = context.Request.UserHostAddress;

            if (ipAddress == LocalhostIP6)
                ipAddress = LocalhostIP4;

            return ipAddress;
        }

    }
}
