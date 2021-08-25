using EveryAngle.Core.Interfaces.Services;
using EveryAngle.Core.ViewModels.Model;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings
{
    public class ClassReferencesManager : IClassReferencesManager
    {
        private readonly IModelService _modelService;
        private List<FieldSourceViewModel> _cachedListOfFieldSources;

        public ClassReferencesManager(IModelService modelService)
        {
            _modelService = modelService ?? throw new System.ArgumentNullException(nameof(modelService));
        }

        public void Initialize(string fieldSourcesUri, string classesUri)
        {
            GetFieldSources(fieldSourcesUri);
        }

        public string GetReferencedClass(string reference)
        {
            FieldSourceViewModel referenceClass = _cachedListOfFieldSources.FirstOrDefault(x => x.id.Equals(reference));

            if (referenceClass != null)
            {
                return GetClassByUri(referenceClass.class_uri);
            }

            return "";
        }

        private string GetClassByUri(string uri)
        {
            ClassViewModel referencedClass = _modelService.GetClass(uri);
            if (referencedClass != null)
            {
                return referencedClass.id;
            }
                      
            return "";
        }

        private void GetFieldSources(string fieldSourcesUri)
        {
            _cachedListOfFieldSources = _cachedListOfFieldSources ?? _modelService.GetFieldSources(fieldSourcesUri + "?" + "limit=999");
        }
    }

}