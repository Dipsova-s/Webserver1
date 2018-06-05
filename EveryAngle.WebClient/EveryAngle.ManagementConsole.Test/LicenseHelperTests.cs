using EveryAngle.Shared.Helpers;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.ManagementConsole.Test
{
    [TestFixture(Category = "MC")]
    public class LicenseHelperTests
    {
        [Test]
        public void LicenseHelper_CanCheckIsValidLicense() 
        { 
            // Prepare
            // Licensed until 12/31/2100
            string licenseDate = "4133894400";

            // Act
            bool expectedLicense = LicenseHelper.IsValidLicense(licenseDate);

            //Assert
            Assert.IsTrue(expectedLicense);
        }
    }
}
