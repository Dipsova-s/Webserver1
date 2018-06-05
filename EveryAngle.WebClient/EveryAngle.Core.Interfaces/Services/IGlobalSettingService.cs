using EveryAngle.Core.ViewModels;
using EveryAngle.Core.ViewModels.BusinessProcesses;
using EveryAngle.Core.ViewModels.Cycle;
using EveryAngle.Core.ViewModels.EAPackage;
using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.Core.ViewModels.SystemCurrencies;
using EveryAngle.Core.ViewModels.SystemLanguages;
using EveryAngle.Core.ViewModels.SystemSettings;
using EveryAngle.Core.ViewModels.Users;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IGlobalSettingService
    {
        ListViewModel<SystemLanguageViewModel> GetSystemLanguages(string languageSystemUri);

        SystemLanguageViewModel GetSystemLanguage(string languageUri);

        SystemLanguageViewModel UpdateLanguage(string languageUri, string updatelanguage);

        BusinessProcessViewModel GetBusinessProcess(string labelUri);

        List<BusinessProcessViewModel> GetBusinessProcesses(string businessProcessUri);

        BusinessProcessViewModel UpdateLabel(string labelCategoryUri, string updatedLabel);

        BusinessProcessViewModel UpdateNewLabel(string labelCategoryUri, string updatedLabel);

        void DeleteBusinessProcessLabel(string labelUri);

        ListViewModel<FieldCategoryViewModel> GetFieldCategories(string uri);

        FieldCategoryViewModel UpdateFieldCategory(string uri, string updateFieldCategory);

        void DeleteFieldCategory(string uri);

        FieldCategoryViewModel CreateFieldCategory(string uri, string createFieldCategory);

        ListViewModel<PackageViewModel> GetPackages(string uri);

        void CreatePackage(string uri, byte[] file, string fileName, string fileType);

        void DeletePackage(string packageUri);

        ListViewModel<SystemRoleViewModel> GetSystemRoles(string uri);

        SystemRoleViewModel GetSystemRole(string uri);

        void UpdateSystemRole(string systemRoleUri, string systemRoleData);

        SystemSettingViewModel GetSystemSettings(string uri);

        SystemSettingViewModel UpdateSystemSetting(string systemSettingUri, string systemSettingData);

        WebClientSettingViewModel GetWebClientSettings(string uri);

        void UpdateWebClientSetting(string uri, string webClientSettingData);

        SystemLicenseViewModel GetLicense(string licenseUri);

        void UpdateLicense(string licenseUri, string licenseData);

        List<CurrenciesViewModel> GetSystemCurrencies(string systemCurrencyUri);

        string TestEmailSettings(string uri, string recipient);

        ListViewModel<TaskHistoryViewModel> GetEventLogs(string uri);
    }
}
