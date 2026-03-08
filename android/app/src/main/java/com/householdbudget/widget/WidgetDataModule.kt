package com.householdbudget.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class WidgetDataModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetDataModule"

    @ReactMethod
    fun saveWidgetData(data: ReadableMap) {
        val context = reactApplicationContext
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val editor = prefs.edit()

        editor.putString("yearMonth", data.getString("yearMonth") ?: "")
        editor.putString("totalExpense", data.getString("totalExpense") ?: "0")
        editor.putString("totalIncome", data.getString("totalIncome") ?: "0")
        editor.putString("remaining", data.getString("remaining") ?: "0")
        editor.putString("updatedAt", data.getString("updatedAt") ?: "")
        editor.apply()

        // 모든 위젯 업데이트 요청
        val intent = Intent(context, BudgetWidget::class.java).apply {
            action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            val ids = AppWidgetManager.getInstance(context)
                .getAppWidgetIds(ComponentName(context, BudgetWidget::class.java))
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        }
        context.sendBroadcast(intent)
    }
}
