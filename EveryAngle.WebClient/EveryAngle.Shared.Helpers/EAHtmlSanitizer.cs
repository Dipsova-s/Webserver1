using Ganss.XSS;

namespace EveryAngle.Shared.Helpers
{
    public class EAHtmlSanitizer
    {
        private static readonly HtmlSanitizer sanitizer = new HtmlSanitizer();

        public static string Sanitize(string html)
        {
            return sanitizer.Sanitize(html);
        }

    }
}
