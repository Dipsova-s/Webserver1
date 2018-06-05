using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace EveryAngle.Shared.EmbeddedViews
{
    public class EmbeddedResourceViewEngine : RazorViewEngine
    {
        private readonly String nameSpace;

        public EmbeddedResourceViewEngine()
        {
            ViewLocationFormats = new[] {
                "~/Resource/{1}/{0}.js",
                "~/Resource/{1}/{0}.css",
                "~/Resource/{1}/{0}.png",
                "~/Resource/{1}/{0}.jpg",
                "~/Resource/{1}/{0}.svg",
                "~/Views/{1}/{0}.aspx",
                "~/Views/{1}/{0}.ascx",
                "~/Views/Shared/{0}.aspx",
                "~/Views/Shared/{0}.ascx",
                "~/Views/{1}/{0}.cshtml",
                "~/Views/{1}/{0}.vbhtml",
                "~/Views/Shared/{0}.cshtml",
                "~/Views/Shared/{0}.vbhtml",
                "~/tmp/Views/{0}.cshtml",
                "~/tmp/Views/{0}.vbhtml",
                "~/tmp/Views/{1}/{0}.cshtml",
                "~/tmp/Views/{1}/{0}.vbhtml",
                "~/tmp/Views/User/PartialViews/{0}.cshtml",
                "~/tmp/Views/User/PartialViews/{0}.vbhtml"
            };
            PartialViewLocationFormats = ViewLocationFormats;

            nameSpace = this.GetType().Namespace;
        }
    }
}
