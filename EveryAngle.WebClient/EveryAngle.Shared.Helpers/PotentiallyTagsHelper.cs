using Microsoft.Security.Application;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace EveryAngle.Shared.Helpers
{
    public static class PotentiallyTagsHelper
    {
        public static IEnumerable<string> HtmlWhiteListTags { get { return _htmlWhiteListTags; } }

        private static readonly IList<string> _htmlWhiteListTags = new List<string>
        {
            "a", "abbr", "acronym", "address", "area", "article", "aside", "b", "bdi", "big", "blockquote", "br", "button", "caption", "center", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dir", "div", "dl", "dt", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "main", "map", "mark", "menu", "menuitem", "meter", "nav", "ol", "optgroup", "option", "output", "p", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section", "select", "small", "span", "strike", "strong", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "tr", "tt", "u", "ul", "var", "wbr"
            // reference from: https://github.com/mganss/HtmlSanitizer#tags-allowed-by-default
            // updated at: 2019/05/02 by Hero
        };

        /// <summary>
        /// check the validating content is safe
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        public static bool IsSafeContent(this string content)
        {
            if (string.IsNullOrEmpty(content))
                return true;

            var contentHtmlTags = GetHtmlTagsInContent(content);

            foreach (var contentHtmlTag in contentHtmlTags)
            {
                if (!_htmlWhiteListTags.Contains(contentHtmlTag))
                    return false;
            }

            return true;
        }
        
        /// <summary>
        /// Check if string content is safe
        /// </summary>
        /// <param name="stringContents"></param>
        /// <returns></returns>
        public static bool IsSafeContent(params string[] stringContents)
        {
            foreach (var stringContent in stringContents)
            {
                if (!stringContent.IsSafeContent())
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Check if string content is safe
        /// </summary>
        /// <param name="contents"></param>
        /// <returns></returns>
        public static bool IsSafeContent(params IEnumerable<string>[] contents)
        {
            foreach (var content in contents)
            {
                if (!content.All(x => x.IsSafeContent()))
                    return false;
            }

            return true;
        }

        /// <summary>
        /// encode the content specified by encode type UrlPath
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        public static string EncodeContent(this string content)
        {
            return Encoder.HtmlEncode(content);
        }

        /// <summary>
        /// get html tags in content
        /// </summary>
        /// <param name="content"></param>
        /// <returns></returns>
        public static IList<string> GetHtmlTagsInContent(string content)
        {
            var tagList = new List<string>();
            string pattern = @"(?<=</?)([^ >/]+)";
            var matches = Regex.Matches(content, pattern);

            for (int i = 0; i < matches.Count; i++)
            {
                tagList.Add(matches[i].ToString());
            }

            return tagList.Distinct().ToList();
        }

    }
    
}

