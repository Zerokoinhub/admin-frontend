"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const getStatusStyle = (status) => {
  switch (status) {
    case "Connected":
      return "bg-green-100 text-green-700";
    case "Not Connected":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const DataTable = ({ data, onView }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">User Details</h2>
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Wallet Address</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Coins Earned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email || "N/A"}</TableCell>
                <TableCell>{user.role || "N/A"}</TableCell>
                <TableCell>{user.country || "N/A"}</TableCell>
                <TableCell>{user.wallet}</TableCell>
                <TableCell>{user.referral}</TableCell>
                <TableCell>{user.coins}</TableCell>
                <TableCell>
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusStyle(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => onView(user)}
                    className="bg-[#0F82F4] hover:bg-[#0d6fd1] text-white text-sm px-4 py-1 h-auto"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DataTable;
