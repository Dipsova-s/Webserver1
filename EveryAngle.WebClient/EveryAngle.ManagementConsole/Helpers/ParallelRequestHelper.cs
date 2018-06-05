using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Shared.Helpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EveryAngle.ManagementConsole.Helpers
{
    // [TODO] This class should be refactored, called a UrlHelperExtension.ParallelRequest which is not testable.
    // this ParallelRequest extesion should be a new instantiate creation with requestManager as a ctor's param to make it testable.
    public class ParallelRequestHelper
    {
        public static List<Field> GetFieldListByIds(ModelViewModel model, List<string> data)
        {
            int numberOfFieldPerRequest = 30;
            List<string> uriList = new List<string>();
            List<string> fieldIdList = data.Distinct().ToList();
            List<Field> fieldNameList = new List<Field>();

            for (int i = 0; i < Math.Ceiling(data.Count / (decimal)numberOfFieldPerRequest); i++)
            {
                List<string> fields = fieldIdList.Skip(i * numberOfFieldPerRequest).Take(numberOfFieldPerRequest).ToList();
                string output = string.Join(",", fields);
                string uri = model.FieldsUri + "?ids=" + output + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, numberOfFieldPerRequest);
                uriList.Add(uri);
            }

            var taskIndex = 0;
            UrlHelperExtension.ParallelRequest(uriList).ForEach(delegate(Task<JObject> task)
            {
                JObject jsonResult = task.Result;
                List<Field> fields = JsonConvert.DeserializeObject<List<Field>>(jsonResult.SelectToken("fields").ToString());
                fieldNameList.AddRange(fields);
                taskIndex++;
            });
           
            return fieldNameList;
        }

        public static List<FieldCategoryViewModel> GetFieldCategoriesByUri(List<string> fieldSourceUriList)
        {
            List<FieldCategoryViewModel> fieldCategories = new List<FieldCategoryViewModel>();
            int taskFieldSourceIndex = 0;
            UrlHelperExtension.ParallelRequest(fieldSourceUriList).ForEach(delegate(Task<JObject> task)
            {
                var jsonResult = task.Result;
                var fieldCategory = JsonConvert.DeserializeObject<FieldCategoryViewModel>(jsonResult.ToString());
                fieldCategories.Add(fieldCategory);
                taskFieldSourceIndex++;
            });

            return fieldCategories;
        }

        public static List<ClassViewModel> GetObjectListByIds(ModelViewModel model, List<string> data)
        {
            var uriList = new List<string>();
            var objectIdList = data.Distinct().ToList();
            int numberOfObjectPerRequest = 30;

            for (int i = 0; i < Math.Ceiling(data.Count / (decimal)numberOfObjectPerRequest); i++)
            {
                List<string> objects = objectIdList.Skip(i * numberOfObjectPerRequest).Take(numberOfObjectPerRequest).ToList();
                string output = string.Join(",", objects);
                string uri = model.ClassesUri + "?ids=" + output + "&" + UtilitiesHelper.GetOffsetLimitQueryString(1, numberOfObjectPerRequest);
                uriList.Add(uri);
            }

            List<ClassViewModel> objectNameList = new List<ClassViewModel>();
            var taskIndex = 0;
            UrlHelperExtension.ParallelRequest(uriList).ForEach(delegate(Task<JObject> task)
            {
                var jsonResult = task.Result;
                var classes = JsonConvert.DeserializeObject<List<ClassViewModel>>(jsonResult.SelectToken("classes").ToString());
                objectNameList.AddRange(classes);
                taskIndex++;
            });
            return objectNameList;
        }

    }
}
