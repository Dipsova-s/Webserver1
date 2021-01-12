using System.Diagnostics.CodeAnalysis;
using System.Web;
using EveryAngle.WebClient.Service.Extensions;
using Microsoft.Owin.Security.Cookies;

namespace EveryAngle.WebClient.Service.Security
{
    /// <summary>
    /// Customized version of <see cref="CookieAuthenticationProvider"/>, which overwrites the cookie path with the current IIS virtual path.
    /// See: https://stackoverflow.com/a/29546013/5214739
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class CustomCookieAuthenticationProvider : CookieAuthenticationProvider
    {
        public override void ResponseSignIn(CookieResponseSignInContext context)
        {
            context.CookieOptions.Path = HttpContext.Current.GetCookiePath();
            base.ResponseSignIn(context);
        }

        public override void ResponseSignOut(CookieResponseSignOutContext context)
        {
            context.CookieOptions.Path = HttpContext.Current.GetCookiePath();
            base.ResponseSignOut(context);
        }
    }
}
