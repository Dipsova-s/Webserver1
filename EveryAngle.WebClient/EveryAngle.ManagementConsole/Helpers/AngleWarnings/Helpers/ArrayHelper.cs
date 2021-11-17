using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EveryAngle.ManagementConsole.Helpers.AngleWarnings.Helpers
{
    public static class ArrayHelper
    {
        public static void AddElementToStringArray(ref string[] stringArray, string elementToBeAdded)
        {
            List<string> tempList = stringArray.ToList();
            tempList.Add(elementToBeAdded);
            stringArray = tempList.ToArray();
        }
    }
}