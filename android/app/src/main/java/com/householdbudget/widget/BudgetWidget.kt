package com.householdbudget.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.os.Build
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
            updateWidget(context, appWidgetManager, appWidgetId, isMedium = false)
        }
    }

    override fun onAppWidgetOptionsChanged(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        newOptions: android.os.Bundle,
    ) {
        updateWidget(context, appWidgetManager, appWidgetId, isMedium = false)
    }

    companion object {
        private const val COLOR_EXPENSE = 0xFF3B82F6.toInt()
        private const val COLOR_INCOME = 0xFFEF4444.toInt()
        private const val COLOR_POSITIVE = 0xFF22C55E.toInt()
        private const val COLOR_NEGATIVE = 0xFFEF4444.toInt()
        private const val COLOR_PROGRESS_NORMAL = 0xFF0D9488.toInt()
        private const val COLOR_PROGRESS_WARNING = 0xFFF59E0B.toInt()
        private const val COLOR_PROGRESS_DANGER = 0xFFEF4444.toInt()

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
            isMedium: Boolean,
        ) {
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val yearMonth = prefs.getString("yearMonth", "") ?: ""
            val totalExpense = prefs.getString("totalExpense", "0")?.toLongOrNull() ?: 0L
            val totalIncome = prefs.getString("totalIncome", "0")?.toLongOrNull() ?: 0L
            val remaining = prefs.getString("remaining", "0")?.toLongOrNull() ?: 0L

            val layoutId = if (isMedium) R.layout.widget_budget_medium else R.layout.widget_budget_small
            val views = RemoteViews(context.packageName, layoutId)

            val launchIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            if (isMedium) {
                bindMedium(views, totalIncome, totalExpense, remaining, formatYearMonth(yearMonth, short = false))
            } else {
                bindSmall(views, totalExpense, remaining, formatYearMonth(yearMonth, short = true))
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun bindSmall(
            views: RemoteViews,
            totalExpense: Long,
            remaining: Long,
            monthLabel: String,
        ) {
            views.setTextViewText(R.id.widget_expense, formatFull(totalExpense))
            val expenseColor = if (remaining < 0) COLOR_NEGATIVE else COLOR_EXPENSE
            views.setInt(R.id.widget_expense, "setTextColor", expenseColor)

            val remainingText = if (remaining < 0) {
                "-${formatFull(-remaining)} 초과"
            } else {
                "잔액 ${formatFull(remaining)}"
            }
            views.setTextViewText(R.id.widget_remaining, remainingText)
            val remainingColor = if (remaining < 0) COLOR_NEGATIVE else COLOR_POSITIVE
            views.setInt(R.id.widget_remaining, "setTextColor", remainingColor)

            views.setTextViewText(R.id.widget_month, monthLabel)
        }

        private fun bindMedium(
            views: RemoteViews,
            totalIncome: Long,
            totalExpense: Long,
            remaining: Long,
            monthLabel: String,
        ) {
            views.setTextViewText(R.id.widget_month, monthLabel)
            views.setTextViewText(R.id.widget_income, formatCompact(totalIncome))
            views.setTextViewText(R.id.widget_expense, formatCompact(totalExpense))
            views.setTextViewText(R.id.widget_remaining, formatCompact(remaining))

            val remainingColor = if (remaining < 0) COLOR_NEGATIVE else COLOR_POSITIVE
            views.setInt(R.id.widget_remaining, "setTextColor", remainingColor)

            val progress = if (totalIncome > 0) {
                ((totalExpense.toFloat() / totalIncome.toFloat()) * 100).toInt().coerceIn(0, 100)
            } else {
                if (totalExpense > 0) 100 else 0
            }
            views.setProgressBar(R.id.widget_progress, 100, progress, false)

            val progressColor = when {
                progress >= 100 -> COLOR_PROGRESS_DANGER
                progress >= 80 -> COLOR_PROGRESS_WARNING
                else -> COLOR_PROGRESS_NORMAL
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                views.setColorStateList(
                    R.id.widget_progress,
                    "setProgressTintList",
                    ColorStateList.valueOf(progressColor),
                )
            }
            views.setTextViewText(R.id.widget_progress_pct, "지출 ${progress}%")
            views.setInt(R.id.widget_progress_pct, "setTextColor", progressColor)
        }

        private fun formatFull(amount: Long): String {
            val formatter = NumberFormat.getInstance(Locale.KOREA)
            return "${formatter.format(amount)}원"
        }

        private fun formatCompact(amount: Long): String {
            val abs = kotlin.math.abs(amount)
            val sign = if (amount < 0) "-" else ""
            return if (abs >= 10000L) {
                val man = abs / 10000L
                "${sign}${man}만원"
            } else {
                val formatter = NumberFormat.getInstance(Locale.KOREA)
                "${sign}${formatter.format(abs)}원"
            }
        }

        private fun formatYearMonth(yearMonth: String, short: Boolean): String {
            if (yearMonth.length != 7) return yearMonth
            val parts = yearMonth.split("-")
            if (parts.size != 2) return yearMonth
            val month = parts[1].trimStart('0')
            return if (short) "${month}월" else "${parts[0]}년 ${month}월"
        }
    }
}
