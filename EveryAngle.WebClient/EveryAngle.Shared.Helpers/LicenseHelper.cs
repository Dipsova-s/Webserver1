using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Shared.Helpers
{
    public static class LicenseHelper
    {
        public static bool IsValidLicense(string licenseDate)
        {
            UInt64 utcUnixNow = (UInt64)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds;
            return utcUnixNow <= Convert.ToUInt64(licenseDate);
        }
    }
}
