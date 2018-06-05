using Kendo.Mvc.UI;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;

namespace EveryAngle.ManagementConsole.Helpers
{
    public static class EventLogHelper
    {
        public static List<TreeViewItemModel> GetTreeViewItemModelList(string data)
        {
            // JObject.Parse cannot handle json array as string, could it be possible to use JsonCovert instead?
            return string.IsNullOrEmpty(data) ?
                   new List<TreeViewItemModel>() :
                   GetTreeViewItemModelList(JObject.Parse(data));
        }

        public static List<TreeViewItemModel> GetTreeViewItemModelList(JToken nodes)
        {
            if (nodes == null)
                return null;

            List<TreeViewItemModel> treeViewItemModelList = new List<TreeViewItemModel>();
            if (nodes.Type == JTokenType.Object)
            {
                foreach (JProperty child in nodes.Children<JProperty>())
                {
                    string nodeText = child.Name;
                    JToken nodeValue = child.Value;

                    if (child.Value.Type != JTokenType.Object && child.Value.Type != JTokenType.Array)
                    {
                        nodeText = string.Format("{0}: {1}", child.Name, child.Value);
                        nodeValue = null;
                    }

                    treeViewItemModelList.Add(new TreeViewItemModel
                    {
                        Text = nodeText,
                        Items = GetTreeViewItemModelList(nodeValue)
                    });
                }
            }
            else if (nodes.Type == JTokenType.Array)
            {
                foreach (JToken node in nodes)
                {
                    treeViewItemModelList.AddRange(GetTreeViewItemModelList(node));
                }
            }
            else if (nodes.Type == JTokenType.String && !string.IsNullOrEmpty(nodes.Value<string>()))
            {
                treeViewItemModelList.Add(new TreeViewItemModel
                {
                    Text = nodes.Value<string>(),
                    Items = null
                });
            }
            return treeViewItemModelList;
        }
    }

}