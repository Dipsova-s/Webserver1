using EveryAngle.Core.ViewModels.SystemSettings;
using Newtonsoft.Json;
using NUnit.Framework;
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
                default_pagesize = 50,
                max_pagesize = 500,
                max_pagesize_appserver = 500,
                session_expiry_minutes = 60,
                remember_expired_sessions_minutes = 120,
                modelserver_check_seconds = 10,
                modelserver_timeout = 30,
                modelserver_metadata_timeout = 300,
                max_domainelements_for_search = 100,
                min_labelcategories_to_publish = 1,
                check_expired_sessions_minutes = 1,
                instances_per_model = 5,
                auto_create_users = false,
                default_system_roles = new List<string> { "sytemRole1", "sytemRole2" },
                trusted_webservers = new List<string> { "0.0.1.1", "0.0.0.1" },
                max_general_history = 99,
                max_audit_log_history = 555,
                allow_grouping_in_pivot_excel_export = false,
                include_self_in_export_headers = false,
                script_location = "c:\\",
                fallback_field_length = 255,
                default_approval_state = "disabled",
                log_level = "INFO",
                EmailSettings = new SystemEmailSettingsViewModel { password = "test", username = "testuser", recipient = "test@test.com", smtp_port = 2, smtp_sender = "test", smtp_server = "testserver", smtp_use_ssl = false}
            };

            //assert type
            Assert.AreEqual(viewModel.default_pagesize.GetType(), typeof(int));
            Assert.AreEqual(viewModel.max_pagesize.GetType(), typeof(int));
            Assert.AreEqual(viewModel.max_pagesize_appserver.GetType(), typeof(int));
            Assert.AreEqual(viewModel.session_expiry_minutes.GetType(), typeof(int));
            Assert.AreEqual(viewModel.remember_expired_sessions_minutes.GetType(), typeof(int));
            Assert.AreEqual(viewModel.modelserver_check_seconds.GetType(), typeof(int));
            Assert.AreEqual(viewModel.modelserver_timeout.GetType(), typeof(int));
            Assert.AreEqual(viewModel.modelserver_metadata_timeout.GetType(), typeof(int));
            Assert.AreEqual(viewModel.max_domainelements_for_search.GetType(), typeof(int));
            Assert.AreEqual(viewModel.min_labelcategories_to_publish.GetType(), typeof(int));
            Assert.AreEqual(viewModel.check_expired_sessions_minutes.GetType(), typeof(int));
            Assert.AreEqual(viewModel.instances_per_model.GetType(), typeof(int));
            Assert.AreEqual(viewModel.auto_create_users.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.default_system_roles.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.trusted_webservers.GetType(), typeof(List<string>));
            Assert.AreEqual(viewModel.max_general_history.GetType(), typeof(int));
            Assert.AreEqual(viewModel.max_audit_log_history.GetType(), typeof(int));
            Assert.AreEqual(viewModel.script_location.GetType(), typeof(string));
            Assert.AreEqual(viewModel.allow_grouping_in_pivot_excel_export.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.include_self_in_export_headers.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.fallback_field_length.GetType(), typeof(int));
            Assert.AreEqual(viewModel.default_approval_state.GetType(), typeof(string));
            Assert.AreEqual(viewModel.log_level.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.GetType(), typeof(SystemEmailSettingsViewModel));
            Assert.AreEqual(viewModel.EmailSettings.smtp_server.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.smtp_port.GetType(), typeof(int));
            Assert.AreEqual(viewModel.EmailSettings.smtp_sender.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.recipient.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.smtp_use_ssl.GetType(), typeof(bool));
            Assert.AreEqual(viewModel.EmailSettings.username.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.password.GetType(), typeof(string));
            Assert.AreEqual(viewModel.EmailSettings.has_password.GetType(), typeof(bool));

            //assert json serialize
            string viewModelSerialize = JsonConvert.SerializeObject(viewModel);
            Assert.IsTrue(viewModelSerialize.Contains("default_pagesize"));
            Assert.IsTrue(viewModelSerialize.Contains("max_pagesize"));
            Assert.IsTrue(viewModelSerialize.Contains("max_pagesize_appserver"));
            Assert.IsTrue(viewModelSerialize.Contains("session_expiry_minutes"));
            Assert.IsTrue(viewModelSerialize.Contains("remember_expired_sessions_minutes"));
            Assert.IsTrue(viewModelSerialize.Contains("modelserver_check_seconds"));
            Assert.IsTrue(viewModelSerialize.Contains("modelserver_timeout"));
            Assert.IsTrue(viewModelSerialize.Contains("modelserver_metadata_timeout"));
            Assert.IsTrue(viewModelSerialize.Contains("max_domainelements_for_search"));
            Assert.IsTrue(viewModelSerialize.Contains("min_labelcategories_to_publish"));
            Assert.IsTrue(viewModelSerialize.Contains("check_expired_sessions_minutes"));
            Assert.IsTrue(viewModelSerialize.Contains("instances_per_model"));
            Assert.IsTrue(viewModelSerialize.Contains("auto_create_users"));
            Assert.IsTrue(viewModelSerialize.Contains("default_system_roles"));
            Assert.IsTrue(viewModelSerialize.Contains("trusted_webservers"));
            Assert.IsTrue(viewModelSerialize.Contains("max_general_history"));
            Assert.IsTrue(viewModelSerialize.Contains("max_audit_log_history"));
            Assert.IsTrue(viewModelSerialize.Contains("allow_grouping_in_pivot_excel_export"));
            Assert.IsTrue(viewModelSerialize.Contains("include_self_in_export_headers"));
            Assert.IsTrue(viewModelSerialize.Contains("fallback_field_length"));
            Assert.IsTrue(viewModelSerialize.Contains("default_approval_state"));
            Assert.IsTrue(viewModelSerialize.Contains("log_level"));
            Assert.IsTrue(viewModelSerialize.Contains("script_location"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_server"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_port"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_sender"));
            Assert.IsTrue(viewModelSerialize.Contains("recipient"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_use_ssl"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_user"));
            Assert.IsTrue(viewModelSerialize.Contains("smtp_password"));
            Assert.IsTrue(viewModelSerialize.Contains("has_password"));
        }
    }
}
