using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.SystemSettings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.Tests
{
    public class SystemSettingViewModelTest : UnitTestBase
    {
        [TestCase]
        public void SystemSettingViewModel_TEST()
        {
            //arrange
            SystemSettingViewModel viewModel = new SystemSettingViewModel
            {
                max_audit_log_history = 555,
                script_location = "c:\\"
            };

            //assert type
            Assert.AreEqual(viewModel.max_audit_log_history.GetType(), typeof(int));
            Assert.AreEqual(viewModel.script_location.GetType(), typeof(string));

            //assert json serialize
            string viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("max_audit_log_history"));
            Assert.IsTrue(viewModelSerialize.Contains("script_location"));
        }
    }
}
