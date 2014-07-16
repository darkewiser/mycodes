using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Data;
using HarbinDemo.DBUtility;
using System.Reflection;
namespace HarbinDemo
{
    public class GetHeartbeatData : IHttpHandler
    {
        public bool IsReusable
        {
            get { return true; }
        }
        /*Request Parameter      
         */
        private string timeUnit = "hour";
        private int pointCount = 13;
        private string dataFormat = "line";

        private int lineCount = 2;

        /******/

        public void ProcessRequest(HttpContext context)
        {
            timeUnit = context.Request.QueryString["timeunit"];
            timeUnit = timeUnit == null ? "hour" : timeUnit.ToLower();

            lineCount = Convert.ToInt32(context.Request.QueryString["linecount"]);
            lineCount = lineCount <= 0 ? 2 : lineCount;
            pointCount = Convert.ToInt32(context.Request.QueryString["pointcount"]);
            pointCount = pointCount <= 0 ? 13 : pointCount;
            dataFormat = context.Request.QueryString["dataformat"] ?? "line";
            string sql = string.Empty;
            switch (timeUnit)
            {
                case "hour":
                    {
                        sql = System.Configuration.ConfigurationManager.AppSettings["pm25QuerySql"];
                        GetDataByHours(context, GetDataTable(sql), new string[] { "score", "aqi" });
                        break;
                    }
                case "day":
                    {
                        sql = System.Configuration.ConfigurationManager.AppSettings["satisfactionQuerySql"];
                        GetDataByDay(context, GetDataTable(sql), new string[] { "score" });
                        break;
                    }
                case "map":
                    {
                        sql = System.Configuration.ConfigurationManager.AppSettings["mapQuerySql"];
                        Map(context, GetDataTable(sql));
                        break;
                    }
                default:
                    {
                        sql = System.Configuration.ConfigurationManager.AppSettings["hotWordQuerySql"];
                        HotWord(context, GetDataTable(sql));
                        break;
                    }
            }

        }
        private DataTable GetDataTable(string sql)
        {
            DbHelper helper = DbHelperFactory.CreateHelper();
            DataSet ds = helper.Query(sql);
            return ds.Tables[0];
        }
       

        public void GetDataByHours(HttpContext context, DataTable dt, string[] fieldName)
        {
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";
            var result = "";
            try
            {

                if (dt.Rows.Count <= 0) return;
                var tx = dt.AsEnumerable();
                fieldName = fieldName != null && fieldName.Length > 0 ? fieldName : new string[] { };
                ArrayList listCols = new ArrayList();
                List<HeartbeatEntry> hlist = new List<HeartbeatEntry>();
                for (var i = 0; i < fieldName.Length; i++)
                {
                    List<HeartbeatEntry> list = (from c in tx
                                                 group c by new { key = c.Field<object>("date_time"), value = c.Field<object>(fieldName[i]) } into g
                                                 select new HeartbeatEntry
                                                 {
                                                     key = SubString(Convert.ToString(g.Key.key), 2, false) + ":00",
                                                     value = Convert.ToString(g.Key.value),
                                                     links = (from p in g
                                                              select new Link
                                                              {
                                                                  text = Convert.ToString(p.Field<object>("url_title")),
                                                                  url = Convert.ToString(p.Field<object>("url_path"))
                                                              }).AsEnumerable<Link>()
                                                 }).ToList<HeartbeatEntry>();
                    listCols.Add(list);
                    hlist.Add(list[list.Count - 1]);
                }

                JavaScriptSerializer jss = new JavaScriptSerializer();

                if (dataFormat == "line")
                {

                    result = jss.Serialize(listCols);
                }
                else
                {

                    result = jss.Serialize(hlist);

                }

            }
            catch (Exception e)
            {
                result = "{\"error\":\"" + e.Message + "\"}";
            }
            response.Write(result);
        }

        private string SubString(string str, int len, bool leftToRight)
        {

            if (!leftToRight)
            {
                int strLen = str.Length;
                if (strLen < len)
                {
                    return str.Substring(0, strLen);
                }
                else
                {
                    return str.Substring(strLen - len);
                }
            }
            else
            {
                return str.Substring(0, len);
            }
        }

        public void GetDataByDay(HttpContext context, DataTable dt, string[] fieldName)
        {
            var request = context.Request;
            var response = context.Response;
            response.ContentType = "text/html";
            var result = "";
            try
            {
                if (dt.Rows.Count <= 0) return;
                var tx = dt.AsEnumerable();
                fieldName = fieldName != null && fieldName.Length > 0 ? fieldName : new string[] { };
                ArrayList listCols = new ArrayList();
                List<HeartbeatEntry> hlist = new List<HeartbeatEntry>();
                for (var i = 0; i < fieldName.Length; i++)
                {
                    List<HeartbeatEntry> list = (from c in tx
                                                 select new HeartbeatEntry()
                                                 {
                                                     //crawldate_id
                                                     key = SubString(Convert.ToString(c.Field<object>("crawldate_id")), 4, false).Insert(2, "-"),
                                                     value = Convert.ToString(c.Field<object>(fieldName[i])),
                                                     links = null

                                                 }).ToList<HeartbeatEntry>();
                    listCols.Add(list);
                    hlist.Add(list[list.Count - 1]);
                }

                JavaScriptSerializer jss = new JavaScriptSerializer();

                if (dataFormat == "line")
                {

                    result = jss.Serialize(listCols);
                }
                else
                {

                    result = jss.Serialize(hlist);

                }

            }
            catch (Exception e)
            {
                result = "{\"error\":\"" + e.Message + "\"}";
            }
            response.Write(result);

        }
      

        public void Map(HttpContext context, DataTable dt)
        {
            if (dt.Rows.Count <= 0) return;
            var tx = dt.AsEnumerable();

            var list = from c in tx
                       select CreateModel<Map>(c);

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = jss.Serialize(list);

            context.Response.Write(result);


        }

        public void HotWord(HttpContext context, DataTable dt)
        {
            if (dt.Rows.Count <= 0) return;
            var tx = dt.AsEnumerable();
            var list = from c in tx
                       select CreateModel<HotWord>(c);

            JavaScriptSerializer jss = new JavaScriptSerializer();

            var result = jss.Serialize(list);

            context.Response.Write(result);
        }

        private T CreateModel<T>(DataRow c)
        {
            Type objType = typeof(T);

            ConstructorInfo constructor = objType.GetConstructor(new Type[] { });
            T objModel = (T)constructor.Invoke(new object[] { });
            var properties = objType.GetProperties();
            string value = "";
            object tmp = null;
            foreach (PropertyInfo p in properties)
            {
                //((System.Reflection.MemberInfo)(p)).Name

                ColumnAttribute column = p.GetCustomAttribute(typeof(ColumnAttribute)) as ColumnAttribute;
                //tmp= c.Field<object>(column.Name);
                //if(tmp!=null){
                //  value=tmp.ToString();
                //}
                //else
                //{
                //value ="";
                //}
                value = Convert.ToString(c.Field<object>(column.Name));

                p.SetValue(objModel, value);
            }
            return objModel;
        }

    }



    public class HeartbeatEntry
    {
        public string key { get; set; }
        public string value { get; set; }
        public IEnumerable<Link> links { set; get; }
    }
    public class Link
    {
        public string url { get; set; }
        public string text { get; set; }
    }
    public class Map
    {

        [Column(Name = "aqi")]
        public string Aqi { get; set; }
        [Column(Name = "area")]
        public string Area { get; set; }
        [Column(Name = "co_24h")]
        public string Co_24h { get; set; }
        [Column(Name = "no2")]
        public string No2 { get; set; }
        [Column(Name = "no2_24h")]
        public string No2_24h { get; set; }
        [Column(Name = "o3")]
        public string O3 { get; set; }
        [Column(Name = "O3_24h")]
        public string O3_24h { get; set; }
        [Column(Name = "O3_8h")]
        public string O3_8h { get; set; }
        [Column(Name = "O3_8h_24h")]
        public string O3_8h_24h { get; set; }
        [Column(Name = "Pm10")]
        public string Pm10 { get; set; }
        [Column(Name = "Pm10_24h")]
        public string Pm10_24h { get; set; }
        [Column(Name = "Pm2_5")]
        public string Pm2_5 { get; set; }
        [Column(Name = "pm2_5_24h")]
        public string pm2_5_24h { get; set; }
        [Column(Name = "Position_name")]
        public string Position_name { get; set; }
        [Column(Name = "Primary_pollutant")]
        public string Primary_pollutant { get; set; }
        [Column(Name = "Quality")]
        public string Quality { get; set; }
        [Column(Name = "So2_24h")]
        public string So2_24h { get; set; }
        [Column(Name = "So2")]
        public string So2 { get; set; }
        [Column(Name = "Station_code")]
        public string Station_code { get; set; }
        [Column(Name = "Time_point")]
        public string Time_point { get; set; }
        [Column(Name = "Lat")]
        public string Lat { get; set; }
        [Column(Name = "lng")]
        public string lng { get; set; }
    }
    public class HotWord
    {
        [Column(Name = "word_name")]
        public string Word_name { get; set; }
        [Column(Name = "word_count")]
        public string Word_count { get; set; }
    }
    [AttributeUsage(AttributeTargets.All)]
    public class ColumnAttribute : Attribute
    {
        public string Name { set; get; }
    }

}






//new Map()
//                       {
//                           Aqi = c.Field<object>("aqi").ToString(),
//                           Area = c.Field<object>("area").ToString(),
//                           Co_24h = c.Field<object>("co_24h").ToString(),
//                           No2 = c.Field<object>("no2").ToString(),
//                           No2_24h = c.Field<object>("no2_24h").ToString(),
//                           O3 = c.Field<object>("o3").ToString(),
//                           O3_24h = c.Field<object>("o3_24h").ToString(),
//                           O3_8h = c.Field<object>("O3_8h").ToString(),
//                           O3_8h_24h = c.Field<object>("O3_8h_24h").ToString(),
//                           Pm10 = c.Field<object>("Pm10").ToString(),
//                           Pm10_24h = c.Field<object>("Pm10_24h").ToString(),
//                           Pm2_5 = c.Field<object>("Pm2_5").ToString(),
//                           pm2_5_24h = c.Field<object>("pm2_5_24h").ToString(),
//                           Position_name = c.Field<object>("Position_name").ToString(),
//                           Primary_pollutant = c.Field<object>("Primary_pollutant").ToString(),
//                           Quality = c.Field<object>("Quality").ToString(),
//                           So2_24h = c.Field<object>("So2_24h").ToString(),
//                           So2 = c.Field<object>("So2").ToString(),
//                           Station_code = c.Field<object>("Station_code").ToString(),
//                           Time_point = c.Field<object>("Time_point").ToString(),
//                           Lat = c.Field<object>("Lat").ToString(),
//                           lng = c.Field<object>("lng").ToString()
//                       };