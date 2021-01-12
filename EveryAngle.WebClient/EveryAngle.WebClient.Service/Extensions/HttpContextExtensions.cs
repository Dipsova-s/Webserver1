using System;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using System.Web;

namespace EveryAngle.WebClient.Service.Extensions
{
    [ExcludeFromCodeCoverage] // Cannot mock Request.ApplicationPath
    public static class HttpContextExtensions
    {
        public static string GetCookiePath(this HttpContext context)
        {
            var path = context?.Request.ApplicationPath;
            if (string.IsNullOrEmpty(path))
            {
                // Fallback to default root path
                return "/";
            }

            // Remove ITMC path if needed
            const string adminPath = "/admin";
            if (path.EndsWith(adminPath, StringComparison.InvariantCultureIgnoreCase))
            {
                path = Regex.Replace(path, adminPath, string.Empty, RegexOptions.IgnoreCase);
            }

            return path;
        }
    }
}
