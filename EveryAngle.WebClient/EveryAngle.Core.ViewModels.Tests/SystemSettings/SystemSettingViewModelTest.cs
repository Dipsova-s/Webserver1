using EveryAngle.Core.ViewModels.SystemSettings;
using Newtonsoft.Json;
using NUnit.Framework;

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
                max_general_history = 99,
                max_audit_log_history = 555,
                script_location = "c:\\"
            };

            //assert type
            Assert.AreEqual(viewModel.max_general_history.GetType(), typeof(int));
            Assert.AreEqual(viewModel.max_audit_log_history.GetType(), typeof(int));
            Assert.AreEqual(viewModel.script_location.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.GetType(), typeof(SystemEmailSettingsViewModel));

            //assert json serialize
            string viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("max_general_history"));
            Assert.IsTrue(viewModelSerialize.Contains("max_audit_log_history"));
            Assert.IsTrue(viewModelSerialize.Contains("script_location"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_server"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_password"));
        }
    }
}
