using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Data.Common;
using System.Data.SqlClient;
using MySql.Data.MySqlClient;
using MySql.Data.Types;
using System.Configuration;
using System.Reflection;

namespace HarbinCockpit.DBUtility
{
    /// <summary>
    /// 数据访问抽象基础类
    /// </summary>
    public abstract class DbHelper
    {
        public readonly string connectionString = ConfigurationManager.AppSettings["connectionString"];
        public abstract DataSet Query(string sqlString);
        public abstract DataSet Query(string sqlString, params DbParameter[] cmdParms);
        public void PrepareCommand(DbCommand cmd, DbConnection conn, DbTransaction trans, string cmdText, DbParameter[] cmdParms)
        {
            if (conn.State != ConnectionState.Open)
            {
                conn.Open();
            }
            cmd.Connection = conn;
            cmd.CommandText = cmdText;
            if (trans != null)
            {
                cmd.Transaction = trans;
            }
            cmd.CommandType = CommandType.Text;
            if (cmdParms != null)
            {
                foreach (DbParameter parameter in cmdParms)
                {
                    if ((parameter.Direction == ParameterDirection.InputOutput || parameter.Direction == ParameterDirection.Input) &&
                         (parameter.Value == null))
                    {
                        parameter.Value = DBNull.Value;
                    }
                    cmd.Parameters.Add(parameter);
                }
            }

        }
    }

    /// <summary>
    /// SQL数据库访问类
    /// </summary>
    public class SqlHelper : DbHelper
    {

        public SqlHelper()
            : base()
        {

        }
        /// <summary>
        /// 执行查询语句，返回DataSet
        /// </summary>
        /// <param name="SQLString">查询语句</param>
        /// <returns>DataSet</returns>
        public override DataSet Query(string sqlString)
        {
            using (SqlConnection connect = new SqlConnection(connectionString))
            {
                DataSet ds = new DataSet();

                using (SqlCommand command = new SqlCommand(sqlString, connect))
                {
                    try
                    {
                        connect.Open();
                        SqlDataAdapter dataAdapter = new SqlDataAdapter(command);
                        dataAdapter.Fill(ds);
                    }
                    catch (System.Data.SqlClient.SqlException ex)
                    {
                        throw new Exception(ex.Message);

                    }
                }
                return ds;
            }
        }
        /// <summary>
        /// 执行查询语句，返回DataSet
        /// </summary>
        /// <param name="SQLString">查询语句</param>
        /// <returns>DataSet</returns>
        public override DataSet Query(string sqlString, params DbParameter[] cmdParms)
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand();
                PrepareCommand(cmd, connection, null, sqlString, cmdParms);
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataSet ds = new DataSet();
                    try
                    {
                        da.Fill(ds, "ds");
                        cmd.Parameters.Clear();
                    }
                    catch (System.Data.SqlClient.SqlException ex)
                    {
                        throw new Exception(ex.Message);
                    }
                    return ds;
                }
            }
        }

    }

    /// <summary>
    /// SQL数据库访问类
    /// </summary>
    public class MySqlHelper : DbHelper
    {
        /// <summary>
        /// 执行查询语句，返回DataSet
        /// </summary>
        /// <param name="SQLString">查询语句</param>
        /// <returns>DataSet</returns>
        public override DataSet Query(string sqlString)
        {
            using (MySqlConnection connect = new MySqlConnection(connectionString))
            {
                DataSet ds = new DataSet();

                using (MySqlCommand command = new MySqlCommand(sqlString, connect))
                {
                    try
                    {
                        connect.Open();
                        MySqlDataAdapter dataAdapter = new MySqlDataAdapter(command);
                        dataAdapter.Fill(ds);
                    }
                    catch (MySql.Data.MySqlClient.MySqlException ex)
                    {
                        throw new Exception(ex.Message);

                    }
                }
                return ds;
            }
        }
        /// <summary>
        /// 执行查询语句，返回DataSet
        /// </summary>
        /// <param name="SQLString">查询语句</param>
        /// <returns>DataSet</returns>
        public override DataSet Query(string sqlString, params DbParameter[] cmdParms)
        {
            using (MySqlConnection connection = new MySqlConnection(connectionString))
            {
                MySqlCommand cmd = new MySqlCommand();
                PrepareCommand(cmd, connection, null, sqlString, cmdParms);
                using (MySqlDataAdapter da = new MySqlDataAdapter(cmd))
                {
                    DataSet ds = new DataSet();
                    try
                    {
                        da.Fill(ds, "ds");
                        cmd.Parameters.Clear();
                    }
                    catch (MySql.Data.MySqlClient.MySqlException ex)
                    {
                        throw new Exception(ex.Message);
                    }
                    return ds;
                }
            }

        }

    }

    /// <summary>
    ///  数据访问类工厂
    /// </summary>
    public class DbHelperFactory
    {
        private static readonly string appsettingStr = ConfigurationManager.AppSettings["dbhelper"];
        private static String AssemblyPath
        {
            get
            {
                string[] str = appsettingStr.Split(',');
                if (str.Length >= 2)
                {
                    return str[1];
                }
                else
                {
                    return Assembly.GetExecutingAssembly().FullName;
                }

            }

        }
        private static String ClassName
        {
            get
            {
                string[] str = appsettingStr.Split(',');
                if (str.Length >= 1)
                {
                    return str[0];
                }
                else
                {
                    return "HarbinCockpit.DBUtility.SqlHelper";
                }
            }
        }
        public static DbHelper CreateHelper()
        {
            DbHelper objType = DataCache.GetCache(ClassName) as DbHelper;
            if (objType == null)
            {
                try
                {
                    objType = Assembly.Load(AssemblyPath).CreateInstance(ClassName) as DbHelper;
                    DataCache.SetCache(ClassName, objType);

                }
                catch
                {
                    return null;
                }
            }
            return objType;

        }

    }

    /// <summary>
    /// 数据缓存类
    /// </summary>
    public class DataCache
    {
        /// <summary>
        /// 获取当前应用程序指定CacheKey的Cache值
        /// </summary>
        /// <param name="CacheKey"></param>
        /// <returns></returns>
        public static object GetCache(string CacheKey)
        {
            System.Web.Caching.Cache objCache = HttpRuntime.Cache;
            return objCache[CacheKey];
        }

        /// <summary>
        /// 设置当前应用程序指定CacheKey的Cache值
        /// </summary>
        /// <param name="CacheKey"></param>
        /// <param name="objObject"></param>
        public static void SetCache(string CacheKey, object objObject)
        {
            System.Web.Caching.Cache objCache = HttpRuntime.Cache;
            objCache.Insert(CacheKey, objObject);
        }
    }
}