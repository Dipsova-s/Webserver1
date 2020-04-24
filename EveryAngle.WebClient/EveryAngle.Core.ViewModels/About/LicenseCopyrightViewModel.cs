using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.About
{
    public class LicenseCopyrightViewModel
    {
        public string title;
        public string magnitudeCopyright;
        public List<LicensePackages> packages;
    }

    public class LicensePackages
    {
        public string name;
        public string license;
        public string copyright;
        public Dictionary<string, string> homepageLink;
        public Dictionary<string, string> licenseLink;
    }
}
