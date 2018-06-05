using Newtonsoft.Json;
using System.Collections.Generic;

namespace EveryAngle.Shared.Helpers
{
    public static class ListExtensions
    {
        public static string ToJson<T>(this List<T> list)
        {
            return JsonConvert.SerializeObject(list);
        }
    }
}
