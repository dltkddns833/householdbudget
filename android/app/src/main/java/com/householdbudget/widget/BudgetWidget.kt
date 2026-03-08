package com.householdbudget.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.householdbudget.MainActivity
import com.householdbudget.R
import java.text.NumberFormat
import java.util.Locale

class BudgetWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val yearMonth = prefs.getString("yearMonth", "") ?: ""
            val totalExpense = prefs.getString("totalExpense", "0")?.toLongOrNull() ?: 0L
            val totalIncome = prefs.getString("totalIncome", "0")?.toLongOrNull() ?: 0L
            val remaining = prefs.getString("remaining", "0")?.toLongOrNull() ?: 0L

            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0)

            // 160dp 이상이면 medium 레이아웃 사용
            val layoutId = if (minWidth >= 160) {
                R.layout.widget_budget_medium
            } else {
                R.layout.widget_budget_small
            }

            val views = RemoteViews(context.packageName, layoutId)

            // 앱 실행 인텐트
            val launchIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val formatter = NumberFormat.getInstance(Locale.KOREA)

            if (layoutId == R.layout.widget_budget_small) {
                views.setTextViewText(R.id.widget_month, formatYearMonth(yearMonth))
                views.setTextViewText(R.id.widget_expense, "${formatter.format(totalExpense)}원")
                views.setTextViewText(R.id.widget_remaining, "${formatter.format(remaining)}원")
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            } else {
                views.setTextViewText(R.id.widget_month, formatYearMonth(yearMonth))
                views.setTextViewText(R.id.widget_income, "${formatter.format(totalIncome)}원")
                views.setTextViewText(R.id.widget_expense, "${formatter.format(totalExpense)}원")
                views.setTextViewText(R.id.widget_remaining, "${formatter.format(remaining)}원")

                // 지출/수입 비율 프로그레스바
                if (totalIncome > 0) {
                    val progress = ((totalExpense.toFloat() / totalIncome.toFloat()) * 100)
                        .toInt().coerceIn(0, 100)
                    views.setProgressBar(R.id.widget_progress, 100, progress, false)
                } else {
                    views.setProgressBar(R.id.widget_progress, 100, 0, false)
                }
                views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun formatYearMonth(yearMonth: String): String {
            if (yearMonth.length != 7) return yearMonth
            val parts = yearMonth.split("-")
            if (parts.size != 2) return yearMonth
            return "${parts[0]}년 ${parts[1].trimStart('0')}월"
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: android.os.Bundle,
    ) {
        updateWidget(context, appWidgetManager, appWidgetId)
    }
}
