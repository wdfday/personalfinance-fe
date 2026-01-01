"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data - replace with real API calls
const mockEvents = [
  {
    id: "1",
    title: "Thanh toán tiền điện",
    date: "2024-12-20",
    time: "09:00",
    type: "bill",
    amount: 850000,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Họp team",
    date: "2024-12-21",
    time: "14:00",
    type: "meeting",
    location: "Office",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Trả nợ thẻ tín dụng",
    date: "2024-12-25",
    time: "10:00",
    type: "payment",
    amount: 5000000,
    status: "upcoming",
  },
  {
    id: "4",
    title: "Sinh nhật bạn",
    date: "2024-12-28",
    time: "18:00",
    type: "birthday",
    status: "upcoming",
  },
]

const mockCalendarDays = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  hasEvent: [5, 10, 15, 20, 21, 25, 28].includes(i + 1),
  isToday: i + 1 === 17,
}))

export function CalendarEventsWidget() {
  const [view, setView] = useState<"calendar" | "events">("events")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <Bell className="h-4 w-4" />
      case "meeting":
        return <Clock className="h-4 w-4" />
      case "payment":
        return <Bell className="h-4 w-4" />
      case "birthday":
        return <Calendar className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "bill":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "payment":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "birthday":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Lịch & Sự kiện</CardTitle>
          <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "events")}>
            <TabsList className="h-8">
              <TabsTrigger value="events" className="text-xs px-3">
                <Clock className="h-3 w-3 mr-1" />
                Sự kiện
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs px-3">
                <Calendar className="h-3 w-3 mr-1" />
                Lịch
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {view === "events" ? (
          <div className="space-y-3">
            {mockEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    {event.amount && (
                      <span className="text-xs font-semibold text-red-600 whitespace-nowrap">
                        {formatCurrency(event.amount)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(event.date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      - {event.time}
                    </span>
                    {event.location && (
                      <>
                        <MapPin className="h-3 w-3 ml-1" />
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {mockEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Không có sự kiện sắp tới</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {mockCalendarDays.map((day) => (
                <Button
                  key={day.day}
                  variant={day.isToday ? "default" : "ghost"}
                  size="sm"
                  className={`h-9 w-full p-0 relative ${
                    day.isToday ? "font-bold" : ""
                  } ${day.hasEvent ? "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary" : ""}`}
                >
                  {day.day}
                </Button>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-muted-foreground">Có sự kiện</span>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                  Xem tất cả
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
